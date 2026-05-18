import { PrismaClient, ModuleName, ActionType } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create super admin company
  const company = await prisma.company.upsert({
    where: { taxId: 'SUPER-000000000' },
    update: {},
    create: {
      legalName: 'ERP System Admin',
      tradeName: 'ERP Admin',
      taxId: 'SUPER-000000000',
      email: 'admin@erp.local',
      status: 'ACTIVE',
    },
  });

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Super Admin' } },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
      companyId: company.id,
    },
  });

  await prisma.role.upsert({
    where: { companyId_name: { companyId: company.id, name: 'User' } },
    update: {},
    create: {
      name: 'User',
      description: 'Standard user',
      isSystem: true,
      companyId: company.id,
    },
  });

  // Create all permissions
  const modules = Object.values(ModuleName);
  const actions = Object.values(ActionType);

  for (const module of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          companyId_module_action: { companyId: company.id, module, action },
        },
        update: {},
        create: {
          module,
          action,
          companyId: company.id,
          description: `${action} in ${module}`,
        },
      });
    }
  }

  // Assign all permissions to admin role
  const permissions = await prisma.permission.findMany({
    where: { companyId: company.id },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id },
      },
      update: { granted: true },
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // Create super admin user
  const hashedPassword = await bcryptjs.hash('Admin123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@erp.local' },
    update: {},
    create: {
      email: 'admin@erp.local',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
      isSuperAdmin: true,
      companyId: company.id,
      roleId: adminRole.id,
    },
  });

  // Create default branch
  await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'HQ' } },
    update: {},
    create: {
      name: 'Headquarters',
      code: 'HQ',
      isDefault: true,
      companyId: company.id,
    },
  });

  // Create default currency
  const existingCurrency = await prisma.currency.findFirst({ where: { companyId: company.id, code: 'MXN' } });
  if (existingCurrency) {
    await prisma.currency.update({ where: { id: existingCurrency.id }, data: { isDefault: true } });
  } else {
    await prisma.currency.create({
      data: {
        code: 'MXN',
        name: 'Mexican Peso',
        symbol: '$',
        exchangeRate: 1.0,
        isDefault: true,
        companyId: company.id,
      },
    });
  }

  // Create default tax
  const existingTax = await prisma.tax.findFirst({ where: { companyId: company.id, name: 'IVA' } });
  if (existingTax) {
    await prisma.tax.update({ where: { id: existingTax.id }, data: { rate: 16.0 } });
  } else {
    await prisma.tax.create({
      data: {
        name: 'IVA',
        rate: 16.0,
        type: 'percentage',
        companyId: company.id,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Login: admin@erp.local / Admin123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
