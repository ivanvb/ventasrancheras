import React from 'react';
import {Formik} from 'formik';
import SignatureField from '../../base/Form/SignatureField/SignatureField';
import ProductPicker from '../../base/Form/ProductPicker/index';
import Button from '../../base/Button/index';
import {View, StyleSheet} from 'react-native';
import Subtitle from '../../base/Subtitle';
import {formatSignature} from '../../lib/util';
import {makeJsonRequest} from '../../lib/request';
import PackageInfo from '../../components/PackageInfo/component';
import {updateVisitStatus} from '../../lib/storage/controller';

function getPickedItems(values, extended = false) {
  const items = [];
  for (const category of values.items) {
    for (const item of category.items) {
      let qty = Number.parseInt(item.qty);
      if (qty > 0) {
        items.push(extended ? item : {id: item.id, qty});
      }
    }
  }
  return items;
}
const SalesOrderForm = ({items, ids, data, setData}) => {
  console.log(ids);
  return (
    <Formik
      initialValues={{
        items,
        signature: '',
      }}
      onSubmit={async values => {
        const items = getPickedItems(values);
        await makeJsonRequest(
          '/salesorder',
          {
            method: 'POST',
            body: JSON.stringify({
              items,
              visitId: ids.visitId,
              customerId: ids.customerId,
              signature: formatSignature(values.signature),
            }),
          },
          true,
        );
        updateVisitStatus(ids.visitId, data, setData);
      }}>
      {({handleSubmit, values, handleChange}) => {
        const pickedItems = getPickedItems(values, true);
        return (
          <View>
            <ProductPicker values={values} handleChange={handleChange} />
            <Subtitle extraStyles={styles.subtitle}>
              Resumen de la orden
            </Subtitle>
            {pickedItems.length > 0 && <PackageInfo items={pickedItems} />}
            <Subtitle extraStyles={styles.subtitle}>Firma del cliente</Subtitle>
            <View style={styles.signatureContainer}>
              <SignatureField name="signature" />
            </View>
            <View style={styles.buttonContainer}>
              <Button text="Submit" onPress={handleSubmit} />
            </View>
          </View>
        );
      }}
    </Formik>
  );
};

const styles = StyleSheet.create({
  signatureContainer: {
    height: 250,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  subtitle: {
    marginVertical: 20,
  },
});

export default SalesOrderForm;
