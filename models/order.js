import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    garment: {
        type: String,
        required: true,
        enum: ['Kaftan', 'Suit', 'Shirt', 'Trouser', 'Agbada', 'Waistcoat']
    },
    quantity: {type: Number, required: true},
    colour: {type: String, required: true},
    fabric: {
        type: String,
        required: true,
        enum: ['Cashmere', 'Silk', 'Cotton', 'Linen', 'Crepe', 'Denim', 'Chinos', 'Ankara']
    },
    price: Number,
    Cost: Number,
    orderDate: {type: Date, default: Date.now},
    deliveryDate: {type: Date, required: true},
    Status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Ready', 'Delivered', 'Cancelled and Refunded', 'Failed'],
        default: 'Pending'
    },
    deliveryAddress: {type: String, required: true}
});


const Order = mongoose.model('Order', orderSchema);

export default Order;