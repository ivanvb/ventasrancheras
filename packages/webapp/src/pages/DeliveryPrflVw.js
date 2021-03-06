import React, { useContext } from "react";
import Assignform from "../Forms/AssignForm";
import { Container, Row, Col } from "react-bootstrap";
import StatusTable from "../Component/StatusTable";
import StatusPack from "../Component/StatusPack";
import { SelectProvider } from "../Context/SelectContext";
import { DataContext } from "../Context/DataContext";
import { UserContext } from "../Context/UserContext";

function DeliveryPrflView(props) {
    const delivery = props.location.state.row;
    const [data] = useContext(DataContext);
    const [user] = useContext(UserContext);

    async function handleFormSubmit({ employeename, assigment }, { setSubmitting, resetForm }) {
        setSubmitting(true);
        const emp = data.deliveries.find(delivery => {
            return employeename === delivery.name;
        });
        await fetch("/delivery/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${user.access_token}`,
            },
            body: JSON.stringify({ deliveryId: emp.id, packageId: assigment }),
        });
        resetForm();
    }

    return (
        <Container fluid>
            <SelectProvider>
                <Row>
                    <Col xs={12} md={8}>
                        <StatusTable rol="Delivery" products={delivery.packages} />
                    </Col>
                    <Col xs={6} md={4}>
                        {" "}
                        <Assignform
                            assign="Package"
                            rol="Delivery"
                            employee={delivery}
                            handleFormSubmit={handleFormSubmit}
                        />
                        <StatusPack rol="Delivery" />
                    </Col>
                </Row>
            </SelectProvider>
        </Container>
    );
}

export default DeliveryPrflView;
