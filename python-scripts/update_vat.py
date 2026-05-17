import glob
import re
from pathlib import Path

files_to_update = [
    'generate_invoice_gl64.py',
    'generate_invoice_esprinter.py',
    'generate_invoice_ad17.py',
    'generate_estimate_sprinter.py',
    'generate_estimate_gl64.py',
    'generate_estimate_ad17.py'
]

for filename in files_to_update:
    p = Path(filename)
    if not p.exists(): continue
    
    content = p.read_text(encoding='utf-8')
    
    content = content.replace(
        '"[VAT_NUMBER]": "<strong>VAT No.:</strong> Pending (HMRC application in progress)"',
        '"[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92"'
    )
    
    # Remove the VAT Notice paragraph
    # We use a regex that handles both single and double quotes around the HTML
    content = re.sub(
        r'[\'"]<p style=[\'"]margin-top:\d+px;font-size:12px;color:#6b7280;[\'"]><strong>VAT Notice:</strong> All prices.*?<\/p>[\'"]',
        '""',
        content,
        flags=re.DOTALL
    )
    
    p.write_text(content, encoding='utf-8')

print("Recent invoices updated.")
