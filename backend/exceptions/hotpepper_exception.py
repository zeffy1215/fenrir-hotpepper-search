# リクエストタイムアウト時のエラー
class HotpepperTimeoutError(Exception):
    pass

# ホットペッパーのサイト側に問題が発生した際のエラー (code=1000)
class HotpepperGatewayError(Exception):
    pass

# API KEYが不正だった場合のエラー (code=2000)
class HotpepperApiKeyError(Exception):
    pass

# パラメーター不正 (code=3000)
class HotpepperBadRequestError(Exception):
    pass

# ホットペッパーAPIでの不明なエラー (code=なし)
class HotpepperError(Exception):
    pass
