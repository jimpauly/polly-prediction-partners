"""kalshi/auth.py — RSA-PSS request signing and Kalshi header construction.

All authenticated requests to Kalshi (both REST and WebSocket login) must include
three headers built here.  The private key is loaded once from a PEM file and reused.

Never log signature values or key material.
"""
from __future__ import annotations

import base64
import time
from pathlib import Path

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding


def load_private_key(pem_path: str):
    """Load an RSA private key from a PEM file path."""
    path = Path(pem_path).expanduser()
    with path.open("rb") as f:
        pem_data = f.read()
    return serialization.load_pem_private_key(pem_data, password=None, backend=default_backend())


def load_private_key_from_pem(pem_string: str):
    """Load an RSA private key directly from a PEM string (no disk I/O)."""
    pem_data = pem_string.encode("utf-8") if isinstance(pem_string, str) else pem_string
    return serialization.load_pem_private_key(pem_data, password=None, backend=default_backend())


def sign_message(private_key, timestamp: str, method: str, path: str) -> str:
    """Sign `timestamp + METHOD + path` with RSA-PSS / SHA-256.

    Returns the Base64-encoded signature string.
    """
    message = (timestamp + method.upper() + path).encode("utf-8")
    raw_signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.DIGEST_LENGTH,
        ),
        hashes.SHA256(),
    )
    return base64.b64encode(raw_signature).decode("utf-8")


def build_headers(api_key: str, private_key, method: str, path: str) -> dict[str, str]:
    """Return the three Kalshi auth headers for a REST request.

    Args:
        api_key:     UUID string from the Kalshi dashboard.
        private_key: Loaded RSA private key object.
        method:      HTTP method (GET, POST, DELETE).
        path:        URL path only — no query string (e.g. /trade-api/v2/portfolio/orders).
    """
    timestamp = str(int(time.time() * 1000))
    signature = sign_message(private_key, timestamp, method, path)
    return {
        "KALSHI-ACCESS-KEY": api_key,
        "KALSHI-ACCESS-SIGNATURE": signature,
        "KALSHI-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json",
    }


def build_ws_login_payload(api_key: str, private_key, msg_id: int = 1) -> dict:
    """Return a WebSocket login command payload.

    The WS login uses method=GET and path=/trade-api/ws/v2.
    """
    timestamp = str(int(time.time() * 1000))
    signature = sign_message(private_key, timestamp, "GET", "/trade-api/ws/v2")
    return {
        "id": msg_id,
        "cmd": "login",
        "params": {
            "api_key": api_key,
            "signature": signature,
            "timestamp": timestamp,
        },
    }
