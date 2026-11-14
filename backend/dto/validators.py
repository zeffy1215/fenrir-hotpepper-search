from exceptions.validation_exception import ValidationError

# 数値に関するバリデーションチェック用
def validate_number(value, name, converter, min_value=None, max_value=None, required=True):
    if not required and not value:
        return None

    try:
        value = converter(value)
    except ValueError as e:
        raise ValidationError(f"{name}に数値以外が入っています") from e
    except TypeError as e:
        raise ValidationError(f"{name}のパラメーターが設定されていません") from e

    if min_value is not None and not (min_value <= value):
        raise ValidationError(f"{name}の値が範囲外です")
    if max_value is not None and not (value <= max_value):
        raise ValidationError(f"{name}の値が範囲外です")

    return value