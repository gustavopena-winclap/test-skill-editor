#!/usr/bin/env python3
"""Echo a payload after a transform. Hello-world style: takes data, prints it."""
import argparse


def transform(text, mode):
    if mode == "upper":
        return text.upper()
    if mode == "reverse":
        return text[::-1]
    if mode == "shout":
        return text.upper() + "!!!"
    return text  # plain


def main():
    p = argparse.ArgumentParser(description="echo-full transformer")
    p.add_argument("--text", default="")
    p.add_argument("--mode", default="plain",
                   choices=["plain", "upper", "reverse", "shout"])
    p.add_argument("--repeat", type=int, default=1)
    args = p.parse_args()
    out = transform(args.text, args.mode)
    for _ in range(max(1, args.repeat)):
        print(f"echo-full[{args.mode}]> {out}")


if __name__ == "__main__":
    main()
