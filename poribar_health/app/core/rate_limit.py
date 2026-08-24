from slowapi import Limiter
from slowapi.util import get_remote_address

# doc Security Notes: "API Rate Limiting: throttle:60,1 middleware সকল public endpoint-এ"
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])