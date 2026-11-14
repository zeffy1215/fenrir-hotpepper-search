from exceptions.validation_exception import ValidationError

# 数値に関するバリデーションチェック用
def validate_number(value, min_value, max_value, converter, name, required=True):
    if not required and not value:
        return

    try:
        value = converter(value)
    except ValueError:
        raise ValidationError(f"{name}に数値以外が入っています")
    except TypeError:
        raise ValidationError(f"{name}のパラメーターが設定されていません")

    if not (min_value <= value <= max_value):
        raise ValidationError(f"{name}の値が範囲外です")

    return value