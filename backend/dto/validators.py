from exceptions.validation_exception import ValidationError

# 数値に関するバリデーションチェック用
def validate_number(value, min_value, max_value, converter, name, required=True):
    if not required and not value:
        return None

    try:
        value = converter(value)
    except ValueError as e:
        raise ValidationError(f"{name}に数値以外が入っています") from e
    except TypeError as e:
        raise ValidationError(f"{name}のパラメーターが設定されていません") from e

    if not (min_value <= value <= max_value):
        raise ValidationError(f"{name}の値が範囲外です")

    return value