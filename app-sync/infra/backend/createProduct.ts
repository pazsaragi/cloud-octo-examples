import AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient()
import Product from './Product'
import { v4 as uuid } from 'uuid';

async function createProduct(product: Product) {
  if (!product.id) {
    product.id = uuid()
  }
  const params = {
    TableName: process.env.PRODUCT_TABLE as string,
    Item: product
  }
  try {
    await docClient.put(params).promise()
    return product
  } catch (err) {
    console.log('DynamoDB error: ', err)
    return null
  }
}

export default createProduct