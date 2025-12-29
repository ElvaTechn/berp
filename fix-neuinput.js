const fs = require('fs');
const path = require('path');

// List of files with NeuInput issues
const files = [
  'src/app/admin/companies/page.tsx',
  'src/app/admin/audit/page.tsx',
  'src/app/admin/subscriptions/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/funcionarios/page.tsx',
  'src/app/inventory/page.tsx',
  'src/app/products/page.tsx',
  'src/app/reservations/page.tsx',
  'src/app/sales/pos/page.tsx',
  'src/app/setup/page.tsx',
  'src/components/employees/AddEmployeeModal.tsx',
  'src/components/employees/EditEmployeeModal.tsx',
  'src/components/inventory/AddProductModal.tsx',
  'src/components/inventory/EditProductModal.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove variant and size from NeuInput
    content = content.replace(/(\s+)variant="concave"\n/g, '\n');
    content = content.replace(/(\s+)size="(sm|md|lg)"\n/g, '\n');
    content = content.replace(/(\s+)variant="concave"\s+size="(sm|md|lg)"\n/g, '\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (err) {
    console.log(`⏭️  Skipped: ${file} (${err.message})`);
  }
});

console.log('\n✅ All files fixed!');
