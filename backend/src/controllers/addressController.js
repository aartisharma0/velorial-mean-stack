import Address from '../models/Address.js';

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort('-createdAt');
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id };

    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id, type: data.type }, { isDefault: false });
    }

    const address = await Address.create(data);
    res.status(201).json({ message: 'Address added.', address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id, type: req.body.type || address.type, _id: { $ne: address._id } }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();
    res.json({ message: 'Address updated.', address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found.' });
    res.json({ message: 'Address deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
