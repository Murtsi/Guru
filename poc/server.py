"""Local, in-memory Guru proof of concept. All offers and orders are synthetic."""

from __future__ import annotations

import json
import math
import secrets
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import urlparse


ROOT = Path(__file__).parent
LOCK = Lock()
REQUEST = {
    "reference": "REQ-DEMO-001",
    "product": "Lactose-free milk",
    "quantity": 1000,
    "unit": "L",
    "hard_requirements": ["lactose-free"],
    "deadline": "2026-11-16",
    "timezone": "Europe/Helsinki",
    "fixture_notice": "Illustrative synthetic data; not a Valio offer or sponsor API response.",
}

# Explicitly fabricated fixture values. Delivery and stock evidence are illustrative.
OFFERS = [
    {
        "id": "SYN-101", "supplier": "Demo Supplier North", "product": "Lactose-free milk",
        "attributes": ["lactose-free"], "pack_l": 10, "price_per_l": 1.20,
        "currency": "EUR", "tax_basis": "illustrative total; tax treatment unverified",
        "available_l": 1200, "stock_as_of": "2026-11-13T09:00:00+02:00",
        "delivery_date": "2026-11-16", "source": "local synthetic fixture",
    },
    {
        "id": "SYN-102", "supplier": "Demo Supplier West", "product": "Lactose-free milk",
        "attributes": ["lactose-free"], "pack_l": 20, "price_per_l": 1.25,
        "currency": "EUR", "tax_basis": "illustrative total; tax treatment unverified",
        "available_l": 1500, "stock_as_of": "2026-11-13T09:00:00+02:00",
        "delivery_date": "2026-11-16", "source": "local synthetic fixture",
    },
    {
        "id": "SYN-103", "supplier": "Demo Supplier South", "product": "Lactose-free milk",
        "attributes": ["lactose-free"], "pack_l": 10, "price_per_l": 1.10,
        "currency": "EUR", "tax_basis": "illustrative total; tax treatment unverified",
        "available_l": 800, "stock_as_of": "2026-11-13T09:00:00+02:00",
        "delivery_date": "2026-11-16", "source": "local synthetic fixture",
    },
    {
        "id": "SYN-104", "supplier": "Demo Supplier East", "product": "Lactose-free milk",
        "attributes": ["lactose-free"], "pack_l": 10, "price_per_l": 1.15,
        "currency": "EUR", "tax_basis": "illustrative total; tax treatment unverified",
        "available_l": 1400, "stock_as_of": "2026-11-13T09:00:00+02:00",
        "delivery_date": "2026-11-17", "source": "local synthetic fixture",
    },
    {
        "id": "SYN-105", "supplier": "Demo Supplier Central", "product": "Standard milk",
        "attributes": ["contains-lactose"], "pack_l": 10, "price_per_l": 0.95,
        "currency": "EUR", "tax_basis": "illustrative total; tax treatment unverified",
        "available_l": 2000, "stock_as_of": "2026-11-13T09:00:00+02:00",
        "delivery_date": "2026-11-16", "source": "local synthetic fixture",
    },
]

STATE = {"previews": {}, "orders": {}, "audit": []}


def money(value: float) -> float:
    return round(value + 1e-9, 2)


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def evaluate_offer(offer: dict) -> dict:
    reasons = []
    if not all(req in offer["attributes"] for req in REQUEST["hard_requirements"]):
        reasons.append("hard_requirement_not_met")
    if offer["available_l"] < REQUEST["quantity"]:
        reasons.append("partial_stock")
    if offer["delivery_date"] > REQUEST["deadline"]:
        reasons.append("delivery_after_deadline")
    if offer["pack_l"] <= 0 or REQUEST["quantity"] % offer["pack_l"] != 0:
        reasons.append("quantity_not_representable_in_packs")
    return {
        **offer,
        "required_packs": REQUEST["quantity"] // offer["pack_l"] if offer["pack_l"] > 0 else None,
        "total": money(REQUEST["quantity"] * offer["price_per_l"]),
        "feasible": not reasons,
        "reasons": reasons,
    }


def audit(event: str, **details: object) -> None:
    STATE["audit"].append({"at": now(), "event": event, **details})


class Handler(BaseHTTPRequestHandler):
    server_version = "GuruLocalPOC/0.1"

    def log_message(self, fmt: str, *args: object) -> None:
        # Avoid logging request bodies or any future credentials.
        print(f"{self.log_date_time_string()} {self.address_string()} {fmt % args}")

    def send_json(self, value: object, status: int = 200) -> None:
        body = json.dumps(value, ensure_ascii=False, indent=2).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict:
        size = int(self.headers.get("Content-Length", "0"))
        if size > 16_384:
            raise ValueError("request_too_large")
        value = json.loads(self.rfile.read(size) or b"{}")
        if not isinstance(value, dict):
            raise ValueError("object_required")
        return value

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/":
            body = (ROOT / "index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/state":
            with LOCK:
                offers = sorted((evaluate_offer(o) for o in OFFERS), key=lambda o: (not o["feasible"], o["total"]))
                self.send_json({"request": REQUEST, "offers": offers, "previews": list(STATE["previews"].values()),
                                "orders": list(STATE["orders"].values()), "audit": STATE["audit"]})
            return
        self.send_json({"error": "not_found"}, 404)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        try:
            data = self.read_json()
            with LOCK:
                if path == "/api/preview":
                    result = self.create_preview(data)
                    self.send_json(result, 200 if "id" in result else 400)
                    return
                if path == "/api/approve":
                    result = self.approve(data)
                    self.send_json(result, 200 if "id" in result else 400)
                    return
                if path == "/api/commit":
                    result = self.commit(data)
                    self.send_json(result, 200 if "order_id" in result else 400)
                    return
            self.send_json({"error": "not_found"}, 404)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json({"error": str(error)}, 400)

    def create_preview(self, data: dict) -> dict:
        offer = next((evaluate_offer(o) for o in OFFERS if o["id"] == data.get("offer_id")), None)
        try:
            limit = round(float(data.get("spend_limit")), 2)
        except (TypeError, ValueError):
            return {"error": "valid_spend_limit_required"}
        if offer is None:
            return {"error": "unknown_offer"}
        if not math.isfinite(limit) or limit < 0 or limit > 1_000_000:
            return {"error": "spend_limit_out_of_range"}
        if not offer["feasible"]:
            return {"error": "offer_does_not_meet_request", "reasons": offer["reasons"]}
        status = "allowed" if offer["total"] <= limit else "approval_required"
        preview = {
            "id": "PRE-" + secrets.token_hex(5).upper(), "request_reference": REQUEST["reference"],
            "offer_id": offer["id"], "supplier": offer["supplier"], "quantity": REQUEST["quantity"],
            "unit": REQUEST["unit"], "total": offer["total"], "currency": offer["currency"],
            "spend_limit": limit, "policy": status, "approval": "not_required" if status == "allowed" else "pending",
            "order_id": None, "created_at": now(),
        }
        STATE["previews"][preview["id"]] = preview
        audit("preview_created", preview_id=preview["id"], offer_id=offer["id"], policy=status)
        return preview

    def approve(self, data: dict) -> dict:
        preview = STATE["previews"].get(data.get("preview_id"))
        if preview is None:
            return {"error": "unknown_preview"}
        if preview["policy"] != "approval_required" or preview["approval"] != "pending":
            return {"error": "approval_not_pending"}
        if data.get("decision") not in ("approve", "reject"):
            return {"error": "explicit_decision_required"}
        preview["approval"] = "approved" if data["decision"] == "approve" else "rejected"
        preview["approval_reference"] = "APR-" + secrets.token_hex(4).upper()
        # Prototype only: the operator click is not authenticated or bound to a real identity.
        preview["approver"] = "local demo operator (unauthenticated)"
        preview["approved_at"] = now()
        audit("approval_decided", preview_id=preview["id"], decision=preview["approval"],
              approval_reference=preview["approval_reference"])
        return preview

    def commit(self, data: dict) -> dict:
        preview = STATE["previews"].get(data.get("preview_id"))
        if preview is None:
            return {"error": "unknown_preview"}
        if preview["order_id"]:
            return STATE["orders"][preview["order_id"]]
        if preview["policy"] == "approval_required" and preview["approval"] != "approved":
            return {"error": "human_approval_required", "approval": preview["approval"]}
        order = {
            "order_id": "MOCK-" + secrets.token_hex(4).upper(), "preview_id": preview["id"],
            "offer_id": preview["offer_id"], "quantity": preview["quantity"], "unit": preview["unit"],
            "total": preview["total"], "currency": preview["currency"], "status": "synthetic_confirmed",
            "created_at": now(),
        }
        preview["order_id"] = order["order_id"]
        STATE["orders"][order["order_id"]] = order
        audit("synthetic_order_committed", preview_id=preview["id"], order_id=order["order_id"])
        return order


if __name__ == "__main__":
    address = ("127.0.0.1", 8000)
    print("Guru local synthetic POC at http://127.0.0.1:8000")
    print("This demo is unauthenticated, in-memory, and does not connect to Valio systems.")
    ThreadingHTTPServer(address, Handler).serve_forever()
