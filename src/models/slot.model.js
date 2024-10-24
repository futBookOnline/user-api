import mongoose from "mongoose";

const slotSchema = mongoose.Schema({
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FutsalVenue'
      }
}, { timestamps: true, strict: false });

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
