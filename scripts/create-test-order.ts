import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TPL-${timestamp}-${random}`;
}

async function main() {
  const USER_ID = 'cmj8g4fv90000rxl0g158s6pi';
  const ADDRESS_ID = 'cmnuwi7fe002zpb016zikddeh';

  const user = await prisma.user.findUnique({ where: { id: USER_ID } });
  const address = await prisma.address.findUnique({ where: { id: ADDRESS_ID } });
  if (!user || !address) throw new Error('User or address not found');

  const items = [
    { variantId: 'cmnsz4h260006pb01ajzb415e', quantity: 1 },
    { variantId: 'cmnp9rmb6000bpa01ltrb8n7d', quantity: 1 },
  ];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map(i => i.variantId) } },
    include: { product: true },
  });

  let subtotal = new Prisma.Decimal(0);
  const orderItems = items.map(i => {
    const v = variants.find(x => x.id === i.variantId)!;
    const unitPrice = new Prisma.Decimal(v.product.price.toString());
    const totalPrice = unitPrice.mul(i.quantity);
    subtotal = subtotal.add(totalPrice);
    return {
      productId: v.productId,
      variantId: v.id,
      productName: v.product.name,
      productSku: v.sku,
      color: v.color,
      size: v.size,
      quantity: i.quantity,
      unitPrice,
      totalPrice,
    };
  });

  const shippingCost = new Prisma.Decimal(5.9);
  const discount = new Prisma.Decimal(0);
  const total = subtotal.add(shippingCost).sub(discount);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user.id,
      addressId: address.id,
      customerEmail: user.email,
      customerPhone: address.phone,
      customerFirstName: address.firstName,
      customerLastName: address.lastName,
      shippingStreet: address.street,
      shippingCity: address.city,
      shippingPostalCode: address.postalCode,
      shippingCountry: address.country,
      subtotal,
      shippingCost,
      discount,
      total,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      deliveryMethod: 'DELIVERY',
      stripeSessionId: `cs_test_FAKE_${Date.now()}`,
      stripePaymentId: `pi_test_FAKE_${Date.now()}`,
      adminNotes: '[COMMANDE FICTIVE DE TEST] Générée pour vérifier le flux complet. Stock non modifié.',
      items: { create: orderItems },
    },
    include: { items: true },
  });

  console.log('Order created:');
  console.log('  orderNumber:', order.orderNumber);
  console.log('  id:', order.id);
  console.log('  total:', order.total.toString(), '€');
  console.log('  items:', order.items.length);
  console.log('  status:', order.status, '/', order.paymentStatus);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
