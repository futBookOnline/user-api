import mongoose from "mongoose";

const reservationSchema = mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "FutsalUser" },
  },
  { timestamps: true, strict: false }
);

const Reservation = mongoose.model("FutsalReservation", reservationSchema);

export default Reservation;
