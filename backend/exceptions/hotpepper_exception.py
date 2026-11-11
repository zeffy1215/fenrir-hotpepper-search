class HotpepperError(Exception):
    pass

# リクエストタイムアウト時のエラー
class HotpepperTimeoutError(HotpepperError):
    pass

# ホットペッパーのサイト側に問題が発生した際のエラー (code=1000)
class HotpepperGatewayError(HotpepperError):
    pass

# API KEYが不正だった場合のエラー (code=2000)
class HotpepperApiKeyError(HotpepperError):
    pass

# パラメーター不正 (code=3000)
class HotpepperBadRequestError(HotpepperError):
    pass