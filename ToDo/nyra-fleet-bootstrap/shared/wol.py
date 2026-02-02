#!/usr/bin/env python3
import argparse, json, socket, sys, pathlib

def mac_to_bytes(mac: str) -> bytes:
    mac = mac.replace("-", ":").lower().strip()
    parts = mac.split(":")
    if len(parts) != 6:
        raise ValueError(f"Invalid MAC: {mac}")
    return bytes(int(p, 16) for p in parts)

def magic_packet(mac: str) -> bytes:
    mac_bytes = mac_to_bytes(mac)
    return b"\xff" * 6 + mac_bytes * 16

def send_wol(mac: str, broadcast: str = "255.255.255.255", port: int = 9):
    pkt = magic_packet(mac)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.sendto(pkt, (broadcast, port))
    s.close()

def main():
    ap = argparse.ArgumentParser(description="Nyra WOL sender")
    ap.add_argument("--config", type=str, default="config/workers.json")
    ap.add_argument("--wake", type=str)
    ap.add_argument("--wake-all", action="store_true")
    args = ap.parse_args()

    cfg_path = pathlib.Path(args.config)
    if not cfg_path.exists():
        print(f"Config not found: {cfg_path}", file=sys.stderr)
        sys.exit(1)

    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    broadcast = cfg.get("broadcast", "255.255.255.255")
    port = int(cfg.get("port", 9))
    workers = cfg.get("workers", [])

    if args.wake_all:
        for w in workers:
            name = w.get("name", "unknown")
            mac = w.get("mac")
            if not mac:
                print(f"Skip {name}: missing mac")
                continue
            print(f"Waking {name} ({mac}) via {broadcast}:{port} ...")
            send_wol(mac, broadcast=broadcast, port=port)
        return

    if args.wake:
        for w in workers:
            if w.get("name") == args.wake:
                mac = w.get("mac")
                if not mac:
                    raise SystemExit(f"{args.wake} missing mac")
                print(f"Waking {args.wake} ({mac}) via {broadcast}:{port} ...")
                send_wol(mac, broadcast=broadcast, port=port)
                return
        raise SystemExit(f"Worker not found: {args.wake}")

    ap.print_help()

if __name__ == "__main__":
    main()
