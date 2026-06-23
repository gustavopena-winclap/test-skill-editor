#!/usr/bin/env python3
"""Render a greeting card. Hello-world style: takes data, prints it back."""
import argparse


def render(name, message, style):
    text = f"{message} {name}"
    if style == "plain":
        return text
    if style == "stars":
        bar = "*" * (len(text) + 4)
        return f"{bar}\n* {text} *\n{bar}"
    # default: box
    bar = "-" * (len(text) + 2)
    return f"+{bar}+\n| {text} |\n+{bar}+"


def main():
    p = argparse.ArgumentParser(description="greet-full card renderer")
    p.add_argument("--name", default="World")
    p.add_argument("--message", default="Hello!")
    p.add_argument("--style", default="box", choices=["box", "plain", "stars"])
    args = p.parse_args()
    print(render(args.name, args.message, args.style))


if __name__ == "__main__":
    main()
