/* eslint-disable camelcase */
const { RolesConstants } = require("@vranch/common");
const Repository = require("../../entities/EntityRepository");
const Employee = require("../../entities/Employee/Employee");
const PackageDelivery = require("../../entities/PackageDelivery/PackageDelivery");
const QBOEmployee = require("../../erp/Employee/Employee");
const Signature = require("../../erp/Signature/Signature");

function formatDelivery(delivery, packageDeliveries) {
    let packagesForThisDelivery = packageDeliveries.filter(packageDelivery => {
        return delivery.id === packageDelivery.emp.id;
    });
    packagesForThisDelivery = packagesForThisDelivery.map(pkg => {
        const myPkg = { ...pkg };
        myPkg.packageId = pkg.qboReceiptId;
        delete myPkg.emp;
        delete myPkg.qboReceiptId;
        return myPkg;
    });

    const formatted = {
        id: delivery.id,
        name: delivery.name,
        email: delivery.email,
        packages: packagesForThisDelivery,
    };

    return formatted;
}
module.exports.getDeliveries = async (req, res, next) => {
    const deliveries = await Repository.findAll({ role: RolesConstants.DELIVERY }, Employee);
    const packageDeliveries = await Repository.findAll({ relations: ["emp"] }, PackageDelivery);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < deliveries.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        deliveries[i] = formatDelivery(deliveries[i], packageDeliveries);
    }
    res.send([...deliveries]);
};

module.exports.getSingleDelivery = async (req, res, next) => {
    let delivery = await Repository.findOne(
        { id: req.id, role: RolesConstants.DELIVERY },
        Employee
    );
    const packageDeliveries = await Repository.findAll({ relations: ["emp"] }, PackageDelivery);
    delivery = await formatDelivery(delivery, packageDeliveries);

    res.send({ ...delivery });
};

module.exports.create = async (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return next(new Error("Missing parameters"));
    }
    try {
        const qboEmployee = await QBOEmployee.createEmployee({
            DisplayName: name,
            GivenName: name,
            FamilyName: name,
            PrimaryEmailAddr: {
                Address: email,
            },
        });
        const employee = new Employee(
            email,
            password,
            name,
            qboEmployee.Id,
            RolesConstants.DELIVERY
        );
        const created = await Repository.create(employee, Employee);
        const formmated = formatDelivery(created, []);
        return res.send({ ...formmated });
    } catch (err) {
        return next(new Error("There was an error creating the employee"));
    }
};

module.exports.assign = async (req, res, next) => {
    const { deliveryId, packageId } = req.body;
    const packageDelivery = new PackageDelivery(deliveryId, packageId, false, "");
    await Repository.create(packageDelivery, PackageDelivery);
    res.sendStatus(200);
};

module.exports.receive = async (req, res, next) => {
    const { packageId } = req.body;
    if (!req.files) return next(new Error("No signature added"));
    const { signature } = req.files;
    if (!packageId || !signature) return next(new Error("Missing parameteres"));

    try {
        await Signature.uploadSignature(signature.data, {
            note: "Delivery received signature",
            imgName: `deliverySignature.jpg`,
            type: "Invoice",
            id: packageId,
        });
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
};

module.exports.deliver = async (req, res, next) => {
    const { packageId } = req.body;
    if (!req.files) return next(new Error("No signature added"));
    const { signature } = req.files;
    if (!packageId || !signature) return next(new Error("Missing parameteres"));
    try {
        await Repository.update({ qboReceiptId: packageId }, { delivered: true }, PackageDelivery);
        await Signature.uploadSignature(signature.data, {
            note: "Customer received signature",
            imgName: `customerSignature.jpg`,
            type: "Invoice",
            id: packageId,
        });
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
};