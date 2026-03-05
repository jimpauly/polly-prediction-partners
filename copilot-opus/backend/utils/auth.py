"""Kalshi RSA-PSS request authentication utilities.

Generates the three authentication headers required by the Kalshi REST and
WebSocket APIs:

* ``KALSHI-ACCESS-KEY`` — the API key identifier.
* ``KALSHI-ACCESS-SIGNATURE`` — an RSA-PSS signature (base-64 encoded).
* ``KALSHI-ACCESS-TIMESTAMP`` — Unix epoch in **milliseconds**.

The signature is computed over the message ``{timestamp_ms}{METHOD}{path}``
using RSA-PSS with SHA-256 and maximum salt length.

.. warning::
   Private key material is **never** logged or printed.
"""

from __future__ import annotations

import base64
import time

from cryptography.exceptions import UnsupportedAlgorithm
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

_HEADER_KEY = "KALSHI-ACCESS-KEY"
_HEADER_SIGNATURE = "KALSHI-ACCESS-SIGNATURE"
_HEADER_TIMESTAMP = "KALSHI-ACCESS-TIMESTAMP"

_WS_METHOD = "GET"
_WS_PATH = "/trade-api/ws/v2"


def sign_request(
    private_key_pem: str,
    api_key_id: str,
    method: str,
    path: str,
    timestamp_ms: int | None = None,
) -> dict[str, str]:
    """Build Kalshi authentication headers for a single request.

    Args:
        private_key_pem: RSA private key in PEM format.
        api_key_id: Kalshi API key identifier.
        method: HTTP method (e.g. ``GET``, ``POST``, ``DELETE``).
        path: Request path **including** any query string
              (e.g. ``/trade-api/v2/markets?limit=10``).
        timestamp_ms: Unix epoch in milliseconds.  When *None* the current
            wall-clock time is used.

    Returns:
        A ``dict`` containing the three ``KALSHI-ACCESS-*`` headers.

    Raises:
        ValueError: If *private_key_pem* cannot be parsed as a valid RSA
            private key.
    """
    if timestamp_ms is None:
        timestamp_ms = int(time.time() * 1_000)

    ts_str = str(timestamp_ms)
    message = f"{ts_str}{method.upper()}{path}".encode()

    private_key = _load_private_key(private_key_pem)
    signature_bytes = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )

    return {
        _HEADER_KEY: api_key_id,
        _HEADER_SIGNATURE: base64.b64encode(signature_bytes).decode(),
        _HEADER_TIMESTAMP: ts_str,
    }


def get_websocket_auth_headers(
    private_key_pem: str,
    api_key_id: str,
) -> dict[str, str]:
    """Build Kalshi authentication headers for the WebSocket handshake.

    Convenience wrapper around :func:`sign_request` that uses the fixed
    method (``GET``) and path (``/trade-api/ws/v2``) expected by the
    Kalshi streaming endpoint.
    """
    return sign_request(
        private_key_pem=private_key_pem,
        api_key_id=api_key_id,
        method=_WS_METHOD,
        path=_WS_PATH,
    )


def _load_private_key(pem_data: str) -> rsa.RSAPrivateKey:
    """Deserialize a PEM-encoded RSA private key.

    Raises:
        ValueError: If the key cannot be loaded or is not an RSA key.
    """
    try:
        key = serialization.load_pem_private_key(
            pem_data.encode(),
            password=None,
        )
    except (ValueError, TypeError, UnsupportedAlgorithm) as exc:
        raise ValueError("Failed to load RSA private key from PEM data") from exc

    if not isinstance(key, rsa.RSAPrivateKey):
        raise ValueError(
            f"Expected an RSA private key, got {type(key).__name__}"
        )

    return key
