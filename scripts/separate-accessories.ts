import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface NewCategoryDef {
  name: string
  slug: string
  description: string
  sortOrder: number
}

const NEW_CATEGORIES: NewCategoryDef[] = [
  { name: 'Bonnets', slug: 'bonnets', description: 'Bonnets en laine premium', sortOrder: 4 },
  { name: 'Stickers', slug: 'stickers', description: 'Stickers holographiques Temporal', sortOrder: 5 },
  { name: 'Upsells', slug: 'upsells', description: 'Produits complémentaires', sortOrder: 6 },
]

function classify(productName: string): 'bonnets' | 'stickers' | 'upsells' {
  const n = productName.toLowerCase()
  if (n.includes('sticker')) return 'stickers'
  if (n.includes('bonnet')) return 'bonnets'
  return 'upsells'
}

async function main() {
  console.log('--- Separate accessoires migration ---\n')

  // 1. Find legacy "accessoires" category
  const legacy = await prisma.category.findUnique({ where: { slug: 'accessoires' } })
  if (!legacy) {
    console.log('No "accessoires" category found. Nothing to migrate.')
  } else {
    console.log(`Found legacy category: ${legacy.name} (id=${legacy.id})`)
  }

  // 2. Create new categories if missing
  const created: Record<string, { id: string; slug: string; name: string }> = {}
  for (const def of NEW_CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        description: def.description,
        sortOrder: def.sortOrder,
      },
    })
    created[def.slug] = { id: cat.id, slug: cat.slug, name: cat.name }
    console.log(`  - Category ensured: ${cat.name} (slug=${cat.slug}, id=${cat.id})`)
  }
  console.log()

  if (!legacy) {
    console.log('Done (no legacy category to clean up).')
    return
  }

  // 3. Re-assign products
  const products = await prisma.product.findMany({
    where: { categoryId: legacy.id },
    select: { id: true, name: true, slug: true },
  })

  console.log(`Re-assigning ${products.length} product(s) currently in "accessoires"...\n`)

  const counts: Record<string, number> = { bonnets: 0, stickers: 0, upsells: 0 }
  const moves: Array<{ name: string; target: string }> = []

  for (const p of products) {
    const target = classify(p.name)
    const targetCat = created[target]
    await prisma.product.update({
      where: { id: p.id },
      data: { categoryId: targetCat.id },
    })
    counts[target]++
    moves.push({ name: p.name, target: targetCat.name })
    console.log(`  - ${p.name}  ->  ${targetCat.name}`)
  }

  console.log('\n--- Summary ---')
  console.log(`  Bonnets : ${counts.bonnets}`)
  console.log(`  Stickers: ${counts.stickers}`)
  console.log(`  Upsells : ${counts.upsells}`)
  console.log(`  Total   : ${products.length}`)
  console.log()

  // 4. Optionally delete the legacy category if empty
  const remaining = await prisma.product.count({ where: { categoryId: legacy.id } })
  if (remaining === 0) {
    await prisma.category.delete({ where: { id: legacy.id } })
    console.log(`Deleted legacy "accessoires" category (was empty).`)
  } else {
    console.log(`Legacy "accessoires" category still has ${remaining} product(s); keeping it.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
