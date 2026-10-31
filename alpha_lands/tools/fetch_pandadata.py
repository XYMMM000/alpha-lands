"""Download one historical series using the user-supplied PandaData SDK contract.

Run locally; credentials are prompted, never written to the export.
"""
import argparse
from datetime import datetime, timezone
from getpass import getpass
from importlib.metadata import version
import json
import math
from pathlib import Path
import re
import sys


def date_text(value):
    if hasattr(value, "strftime"):
        return value.strftime("%Y%m%d")
    text = str(value).strip()
    if re.fullmatch(r"\d{8}\.0", text):
        text = text[:-2]
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}(?:[ T].*)?", text):
        text = text[:10].replace("-", "")
    if not re.fullmatch(r"\d{8}", text):
        raise ValueError("日期字段不是可识别的交易日期")
    datetime.strptime(text, "%Y%m%d")
    return text


def normalize(result, symbol, start, end):
    if isinstance(result, list):
        records = result
    elif hasattr(result, "to_dict"):
        records = result.to_dict(orient="records")
    else:
        raise ValueError("SDK 返回结构与预期不同，需要核对文档；未将其当成行情保存")
    if not records:
        raise ValueError("接口没有返回行情，请检查权限、股票代码和日期")
    rows, dates = [], set()
    for item in records:
        if not isinstance(item, dict):
            raise ValueError("行情记录不是字段字典")
        row = {"symbol": str(item.get("symbol", symbol)), "date": date_text(item["date"])}
        if row["symbol"] != symbol or not start <= row["date"] <= end:
            raise ValueError("返回的股票或日期超出请求范围")
        if row["date"] in dates:
            raise ValueError("返回行情包含重复日期")
        dates.add(row["date"])
        for field in ("open", "high", "low", "close", "volume"):
            value = float(item[field])
            if not math.isfinite(value) or value < 0 or (field != "volume" and value == 0):
                raise ValueError("行情含有无效价格或成交量")
            row[field] = value
        if row["low"] > min(row["open"], row["close"]) or row["high"] < max(row["open"], row["close"]):
            raise ValueError("最高价、最低价与开收盘价不一致")
        rows.append(row)
    return sorted(rows, key=lambda row: row["date"])


def main():
    parser = argparse.ArgumentParser(description="Alpha Lands · PandaData 历史日线导出")
    parser.add_argument("--symbol", default="000001.SZ")
    parser.add_argument("--start", default="20250101")
    parser.add_argument("--end", default="20251231")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "pandadata_daily.json")
    args = parser.parse_args()
    if not (3, 10) <= sys.version_info[:2] <= (3, 12):
        print("此取数环境需要 Python 3.10–3.12。SDK 依赖 NumPy 1.x，请勿在 Python 3.14 中安装。")
        print("请使用项目独立环境 .venv-pandadata 中的 python.exe 运行本脚本。")
        return 1
    try:
        start, end = date_text(args.start), date_text(args.end)
        if start > end:
            raise ValueError("开始日期不能晚于结束日期")
        if not re.fullmatch(r"\d{6}\.(SZ|SH|BJ)", args.symbol):
            raise ValueError("请使用带交易所后缀的 A 股代码，例如 000001.SZ")
    except ValueError as exc:
        parser.error(str(exc))
    try:
        import panda_data
    except ImportError:
        print("缺少 SDK。请在 Python 3.12 独立环境中安装 panda_data。")
        return 1

    username = input("PandaAI 注册手机号（可带 86 前缀）：").strip()
    username = username.removeprefix("+")
    if re.fullmatch(r"1\d{10}", username):
        username = "86" + username
    if not re.fullmatch(r"861\d{10}", username):
        print("手机号格式不正确，请重新运行。")
        return 1
    password = getpass("官网登录密码（输入时不显示）：")
    try:
        panda_data.init_token(username=username, password=password)
        result = panda_data.get_stock_daily(
            symbol=[args.symbol], start_date=start, end_date=end,
            fields=["open", "high", "low", "close", "volume"],
        )
    except Exception:
        # Do not print authentication/SDK exception bodies: they may contain credentials.
        print("认证或取数失败。请核对官网账号密码、赛事数据权限和网络连接。")
        return 1
    finally:
        password = None
    try:
        rows = normalize(result, args.symbol, start, end)
        payload = {
            "schemaVersion": 1,
            "source": "Panda Data",
            "method": "get_stock_daily",
            "sdkVersion": version("panda_data"),
            "fetchedAt": datetime.now(timezone.utc).isoformat(),
            "market": "A股",
            "symbol": args.symbol,
            "requestedRange": {"start": start, "end": end},
            "actualRange": {"start": rows[0]["date"], "end": rows[-1]["date"]},
            "priceBasis": "get_stock_daily 原始返回口径，未额外复权；以官方接口说明为准",
            "usage": "历史研究样本；接入游戏时需按决策日期隔离后续数据，不代表已完成回测",
            "count": len(rows),
            "rows": rows,
        }
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
        browser_keys = ("source", "method", "sdkVersion", "fetchedAt", "market", "symbol", "actualRange", "priceBasis", "rows")
        browser_payload = {key: payload[key] for key in browser_keys}
        args.output.with_suffix(".js").write_text(
            "// Generated Panda Data historical sample. No credentials.\nwindow.ALPHA_HISTORY_SOURCE = "
            + json.dumps(browser_payload, ensure_ascii=False, allow_nan=False) + ";\n", encoding="utf-8"
        )
    except (ValueError, KeyError, TypeError, OSError):
        print("行情校验或导出失败：需要核对返回字段、数据质量和输出路径。未输出 SDK 原始响应。")
        return 1
    print(f"已导出 {len(rows)} 条日线：{args.output.resolve()}")
    print("已同时生成浏览器数据文件 .js；刷新游戏后点击「真实行情」。请按赛事授权范围使用。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
