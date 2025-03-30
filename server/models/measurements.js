import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MeasurementSchema = new Schema({
    Neck: {type: Number, required: true},
    Shoulder: {type: Number, required: true},
    Chest: {type: Number, required: true},
    NaturalWaist: {type: Number, required: true},
    Hip: {type: Number, required: true},
    KaftanLength: {type: Number, required: true},
    SuitLength: {type: Number, required: true},
    LongSleeve: {type: Number, required: true},
    ShortSleeve: {type: Number, required: true},
    MidSleeve: {type: Number, required: true},
    ShortSleeveWidth: {type: Number, required: true},
    TrouserLength: {type: Number, required: true},
    ThighWidth: {type: Number, required: true},
    KneeWidth: {type: Number, required: true},
    AnkleWidth: {type: Number, required: true}
});

const Measurement = mongoose.model('Measurement', MeasurementSchema);

export default Measurement;