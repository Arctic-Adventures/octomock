import {
  getBookingSchema,
  GetBookingSchema,
  GetBookingsSchema,
  getBookingsSchema,
} from "./../schemas/Booking";
import { CapabilityId } from "./../types/Capability";
import Router from "@koa/router";
import { ProductController } from "../controllers/ProductController";
import { BookingController } from "../controllers/BookingController";
import { CreateBookingSchema } from "../schemas/Booking";
import { AvailabilityController } from "../controllers/AvailabilityController";
import {
  availabilitySchema,
  AvailabilitySchema,
} from "../schemas/Availability";
import { AvailabilityValidator } from "../validators/AvailabilityValidator";

export const router = new Router();
const productController = new ProductController();
const availabilityController = new AvailabilityController();
const bookingController = new BookingController();
const availabilityValidator = new AvailabilityValidator();

const getCapabilities = (ctx: any): CapabilityId[] => {
  return ctx.capabilities as CapabilityId[];
};

router.get("/products", (ctx, _) => {
  // const __ = getCapabilities(ctx);
  const data = productController.getProducts();
  ctx.body = data;
  ctx.toJSON();
});

router.get("/products/:productId", (ctx, _) => {
  // const __ = getCapabilities(ctx);
  const productId = ctx.params.productId;
  const data = productController.getProduct(productId);
  ctx.body = data;
  ctx.toJSON();
});

router.get("/availability", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: AvailabilitySchema = {
    productId: "1",
    optionId: "DEFAULT",
    // localDate: "2021-12-20",
    localDateStart: "2021-12-20",
    localDateEnd: "2021-12-30",
  };

  await availabilitySchema.validate(data);
  const schema = availabilitySchema.cast(data) as AvailabilitySchema;
  availabilityValidator.validate({
    availabilityIds: schema.availabilityIds,
    localDate: schema.localDate,
    localDateEnd: schema.localDateEnd,
    localDateStart: schema.localDateStart,
  });

  const body = await availabilityController.getAvailability(
    schema,
    capabilities
  );

  ctx.body = body;
  ctx.toJSON();
});

router.post("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data = await bookingController.createBooking(
    {
      uuid: undefined,
      productId: "1",
      optionId: "DEFAULT",
      availabilityId: "2021-12-30T00:00:00+00:00",
      unitItems: [{ unitId: "adult" }],
      resellerReference: "reseller",
    } as CreateBookingSchema,
    capabilities
  );
  ctx.body = data;
  ctx.toJSON();
});

router.get("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetBookingSchema = {
    uuid: ctx.params.uuid,
  };

  await getBookingSchema.validate(data);
  const schema = getBookingSchema.cast(data);
  const result = await bookingController.getBooking(schema, capabilities);
  ctx.body = result;
  ctx.toJSON();
});

router.get("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetBookingsSchema = {
    resellerReference: ctx.query.resellerReference as string,
    supplierReference: ctx.query.supplierReference as string,
  };

  await getBookingsSchema.validate(data);
  const schema = getBookingsSchema.cast(data);
  const result = await bookingController.getBookings(schema, capabilities);
  ctx.body = result;
  ctx.toJSON();
});
