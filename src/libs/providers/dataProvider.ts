import {
  dataProvider as directusDataProvider
} from "@tspvivek/refine-directus";
import { directusClient } from "./directusClient";

const dataProvider = directusDataProvider(directusClient);

export default dataProvider;