import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultMaterials = [
  // Flooring Materials
  {
    name: 'Carpet',
    description: 'Standard carpet material',
    variance: 12.5,
    isDefault: true,
  },
  {
    name: 'Hardwood Flooring',
    description: 'Solid hardwood flooring',
    variance: 8.2,
    isDefault: true,
  },
  {
    name: 'Laminate Flooring',
    description: 'Laminate wood flooring',
    variance: 10.1,
    isDefault: true,
  },
  {
    name: 'Vinyl Flooring',
    description: 'Vinyl plank or tile flooring',
    variance: 14.3,
    isDefault: true,
  },
  {
    name: 'Tile Flooring',
    description: 'Ceramic or porcelain tile',
    variance: 6.8,
    isDefault: true,
  },
  {
    name: 'Concrete Floor',
    description: 'Poured concrete flooring',
    variance: 9.4,
    isDefault: true,
  },
  {
    name: 'Marble Flooring',
    description: 'Natural marble flooring',
    variance: 7.2,
    isDefault: true,
  },
  {
    name: 'Granite Flooring',
    description: 'Natural granite flooring',
    variance: 5.9,
    isDefault: true,
  },

  // Wall Materials
  {
    name: 'Drywall',
    description: 'Standard drywall panels',
    variance: 11.7,
    isDefault: true,
  },
  {
    name: 'Plaster',
    description: 'Traditional plaster walls',
    variance: 13.1,
    isDefault: true,
  },
  {
    name: 'Plaster w/Lath',
    description: 'Plaster over wood lath',
    variance: 15.0,
    isDefault: true,
  },
  {
    name: 'Panel Walls',
    description: 'Wood or composite paneling',
    variance: 12.8,
    isDefault: true,
  },
  {
    name: 'Brick Walls',
    description: 'Exposed brick walls',
    variance: 8.5,
    isDefault: true,
  },
  {
    name: 'Stone Walls',
    description: 'Natural stone wall material',
    variance: 7.3,
    isDefault: true,
  },
  {
    name: 'Concrete Walls',
    description: 'Poured concrete walls',
    variance: 9.1,
    isDefault: true,
  },

  // Ceiling Materials
  {
    name: 'Drywall Ceiling',
    description: 'Standard drywall ceiling',
    variance: 11.2,
    isDefault: true,
  },
  {
    name: 'Popcorn Ceiling',
    description: 'Textured popcorn ceiling',
    variance: 16.4,
    isDefault: true,
  },
  {
    name: 'Suspended Ceiling',
    description: 'Drop ceiling tiles',
    variance: 13.7,
    isDefault: true,
  },
  {
    name: 'Wood Ceiling',
    description: 'Wood plank ceiling',
    variance: 10.8,
    isDefault: true,
  },
  {
    name: 'Metal Ceiling',
    description: 'Metal ceiling panels',
    variance: 8.9,
    isDefault: true,
  },

  // Insulation Materials
  {
    name: 'Fiberglass Insulation',
    description: 'Standard fiberglass insulation',
    variance: 14.2,
    isDefault: true,
  },
  {
    name: 'Cellulose Insulation',
    description: 'Recycled paper insulation',
    variance: 15.8,
    isDefault: true,
  },
  {
    name: 'Spray Foam Insulation',
    description: 'Polyurethane spray foam',
    variance: 12.1,
    isDefault: true,
  },
  {
    name: 'Mineral Wool Insulation',
    description: 'Rock or slag wool insulation',
    variance: 11.5,
    isDefault: true,
  },

  // Specialty Materials
  {
    name: 'Cork Flooring',
    description: 'Natural cork flooring',
    variance: 13.9,
    isDefault: true,
  },
  {
    name: 'Bamboo Flooring',
    description: 'Bamboo plank flooring',
    variance: 10.3,
    isDefault: true,
  },
  {
    name: 'Linoleum',
    description: 'Natural linoleum flooring',
    variance: 14.6,
    isDefault: true,
  },
  {
    name: 'Terrazzo',
    description: 'Composite terrazzo flooring',
    variance: 6.4,
    isDefault: true,
  },
  {
    name: 'Cork Wall Panels',
    description: 'Cork wall covering',
    variance: 12.9,
    isDefault: true,
  },
];

async function seedMaterials() {
  console.log('🌱 Seeding default materials...');

  for (const material of defaultMaterials) {
    try {
      const isMaterialExists = await prisma.material.findFirst({
        where: {
          name: material.name,
          organizationId: null,
        },
      });
      if (isMaterialExists) {
        console.log(`❌ Material ${material.name} already exists`);
        continue;
      }
      await prisma.material.create({
        data: {
          name: material.name,
          description: material.description,
          variance: material.variance,
          isDefault: material.isDefault,
        },
      });
      console.log(`✅ Seeded material: ${material.name}`);
    } catch (error) {
      console.error(`❌ Error seeding material ${material.name}:`, error);
    }
  }

  console.log('🎉 Default materials seeding completed!');
}

// Add seeding for EquipmentCategory
async function seedEquipmentCategories(prisma) {
  const defaultCategories = ['Dehumidifiers', 'Air Movers', 'Air Scrubbers'];

  const organizations = await prisma.organization.findMany();

  for (const org of organizations) {
    for (const name of defaultCategories) {
      await prisma.equipmentCategory.upsert({
        where: {
          name_organizationId: {
            name,
            organizationId: org.id,
          },
        },
        update: {},
        create: {
          name,
          organizationId: org.id,
          isDefault: true,
        },
      });
    }
  }
}

async function main() {
  try {
    await seedMaterials();
    await seedEquipmentCategories(prisma);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedMaterials };
