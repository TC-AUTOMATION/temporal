import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TPL-${timestamp}-${random}`;
}

async function main() {
  const USER_ID = 'cmj8g4fv90000rxl0g158s6pi';
  const user = await prisma.user.findUnique({ where: { id: USER_ID } });
  if (!user) throw new Error('User not found');

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

  // Gauge: free shipping kicks in at 100€ and this order is 132.96€
  const FREE_SHIPPING_THRESHOLD = 100;
  const baseShipping = new Prisma.Decimal(3.9);
  const shippingCost = subtotal.gte(FREE_SHIPPING_THRESHOLD)
    ? new Prisma.Decimal(0)
    : baseShipping;
  const discount = new Prisma.Decimal(0);
  const total = subtotal.add(shippingCost).sub(discount);

  // Real Mondial Relay pickup point in BUEIL (returned by the parcel-point API earlier)
  const relayPointCode = '33824';
  const relayPointName = 'COCCIMARKET';
  const relayPointAddress = 'GRAND RUE';
  const relayPointCity = 'BUEIL';
  const relayPointPostalCode = '27730';
  const relayCarrier = 'mondial_relay';

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user.id,
      customerEmail: user.email,
      customerPhone: '0781807061',
      customerFirstName: 'Chloé',
      customerLastName: 'THIEL',
      // For relay orders the "shipping address" is the relay point itself
      shippingStreet: relayPointAddress,
      shippingCity: relayPointCity,
      shippingPostalCode: relayPointPostalCode,
      shippingCountry: 'FR',
      relayCarrier,
      relayPointCode,
      relayPointName,
      relayPointAddress,
      subtotal,
      shippingCost,
      discount,
      total,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      deliveryMethod: 'RELAY',
      stripeSessionId: `cs_test_FAKE_RELAY_${Date.now()}`,
      stripePaymentId: `pi_test_FAKE_RELAY_${Date.now()}`,
      adminNotes: `[COMMANDE FICTIVE DE TEST — POINT RELAIS]\nPoint relais Mondial Relay ${relayPointName} (${relayPointCode}) - ${relayPointAddress}, ${relayPointPostalCode} ${relayPointCity}\nStock non modifié.`,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  console.log('Order created:');
  console.log('  orderNumber:', order.orderNumber);
  console.log('  id:', order.id);
  console.log('  subtotal:', order.subtotal.toString(), '€');
  console.log('  shipping:', order.shippingCost.toString(), '€', subtotal.gte(FREE_SHIPPING_THRESHOLD) ? '(offerte — jauge 100€)' : '');
  console.log('  total:', order.total.toString(), '€');
  console.log('  deliveryMethod:', order.deliveryMethod);
  console.log('  relay:', `${order.relayPointName} (${order.relayPointCode}) - ${order.relayCarrier}`);
  console.log('  relay address:', `${order.relayPointAddress}, ${order.shippingPostalCode} ${order.shippingCity}`);
  console.log('  status:', order.status, '/', order.paymentStatus);
  console.log('  items:', order.items.length);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
