from pathlib import Path
import struct
import zlib

out = Path('assets')
out.mkdir(exist_ok=True)


def write_png(path, width, height, fill):
    pixels = bytearray()
    for y in range(height):
        pixels.append(0)
        for x in range(width):
            r, g, b = fill(x, y, width, height)
            pixels.extend((r, g, b))

    def chunk(tag, data):
        return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = zlib.compress(pixels, 9)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', raw)
    png += chunk(b'IEND', b'')
    path.write_bytes(png)


def icon_fill(x, y, width, height):
    if 260 <= x <= 760 and 280 <= y <= 740:
        return (255, 255, 255)
    if 320 <= x <= 700 and 320 <= y <= 700:
        return (7, 12, 30)
    if 330 <= x <= 670 and 360 <= y <= 700 and ((x < 500 and y < 560) or (x > 500 and y > 560)):
        return (255, 255, 255)
    if 450 <= x <= 580 and 420 <= y <= 640:
        return (255, 255, 255)
    r = int(6 + (x / width) * 22)
    g = int(10 + (y / height) * 40)
    b = int(24 + (x / width) * 60)
    return (r, g, b)


def splash_fill(x, y, width, height):
    if 280 <= x <= 960 and 620 <= y <= 1120:
        return (255, 255, 255)
    if 360 <= x <= 880 and 700 <= y <= 1040:
        return (7, 12, 30)
    if 420 <= x <= 820 and 780 <= y <= 1020 and ((x < 620 and y < 900) or (x > 620 and y > 900)):
        return (255, 255, 255)
    if 520 <= x <= 720 and 860 <= y <= 1020:
        return (255, 255, 255)
    r = int(6 + (x / width) * 22)
    g = int(10 + (y / height) * 40)
    b = int(24 + (x / width) * 60)
    return (r, g, b)

write_png(out / 'icon.png', 1024, 1024, icon_fill)
write_png(out / 'splash.png', 1242, 2208, splash_fill)
print('Created assets/icon.png and assets/splash.png')
