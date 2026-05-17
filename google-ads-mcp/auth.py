"""Bearer token auth from ADS_API_SECRET."""

import os

from dotenv import load_dotenv
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

bearer = HTTPBearer(auto_error=False)


def verify_token(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer),
) -> None:
    secret = os.getenv("ADS_API_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="ADS_API_SECRET is not configured")
    if credentials is None or credentials.credentials != secret:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
