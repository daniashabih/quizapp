import zipfile
import io
import sys

def decode_varint(stream):
    res = 0
    shift = 0
    while True:
        b = stream.read(1)
        if not b:
            return None
        byte = b[0]
        res |= (byte & 0x7F) << shift
        if not (byte & 0x80):
            break
        shift += 7
    return res

def parse_proto(stream, length=None):
    fields = []
    start = stream.tell()
    while True:
        if length is not None and (stream.tell() - start) >= length:
            break
        tag = decode_varint(stream)
        if tag is None:
            break
        wire_type = tag & 0x07
        field_num = tag >> 3
        if wire_type == 0:
            val = decode_varint(stream)
            fields.append((field_num, 'varint', val))
        elif wire_type == 1:
            val = stream.read(8)
            fields.append((field_num, 'fixed64', val))
        elif wire_type == 2:
            l = decode_varint(stream)
            val = stream.read(l)
            fields.append((field_num, 'bytes', val))
        elif wire_type == 5:
            val = stream.read(4)
            fields.append((field_num, 'fixed32', val))
        else:
            break
    return fields

def dump_node(data, indent=0):
    fields = parse_proto(io.BytesIO(data))
    for f_num, f_type, f_val in fields:
        if f_num == 1 and f_type == 'bytes':  # element
            elem_fields = parse_proto(io.BytesIO(f_val))
            name = ''
            attrs = {}
            children = []
            for ef_num, ef_type, ef_val in elem_fields:
                if ef_num == 5:  # name
                    name = ef_val.decode('utf-8', errors='ignore')
                elif ef_num == 2:  # attribute
                    attr_f = parse_proto(io.BytesIO(ef_val))
                    a_name = ''
                    a_val = ''
                    compiled_val = None
                    for af_num, af_type, af_val in attr_f:
                        if af_num == 2:
                            a_name = af_val.decode('utf-8', errors='ignore')
                        elif af_num == 3:
                            a_val = af_val.decode('utf-8', errors='ignore')
                        elif af_num == 6:  # compiled_item
                            ci_f = parse_proto(io.BytesIO(af_val))
                            for ci_num, ci_type, ci_val in ci_f:
                                if ci_num == 7:  # prim
                                    pf = parse_proto(io.BytesIO(ci_val))
                                    for pfn, pft, pfv in pf:
                                        if pfn == 6:  # int_dec_value
                                            compiled_val = pfv
                    attrs[a_name] = (a_val, compiled_val)
                elif ef_num == 3:  # child
                    children.append(ef_val)
            attr_str = ' '.join(f'{k}="{v[0]}"(code={v[1]})' for k, v in attrs.items())
            print('  ' * indent + f'<{name} {attr_str}>')
            if name == 'manifest':
                for c in children:
                    dump_node(c, indent + 1)

def verify_aab(aab_path):
    print(f"\n==========================================")
    print(f"VERIFYING AAB: {aab_path}")
    print(f"==========================================")
    with zipfile.ZipFile(aab_path) as z:
        raw = z.read('base/manifest/AndroidManifest.xml')
    dump_node(raw)

if __name__ == '__main__':
    for p in sys.argv[1:]:
        verify_aab(p)
