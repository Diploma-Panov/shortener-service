import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from '../config';

const dynamo = new DynamoDBClient({ region: config.dynamodb.region });

export const ddb = DynamoDBDocumentClient.from(dynamo);
