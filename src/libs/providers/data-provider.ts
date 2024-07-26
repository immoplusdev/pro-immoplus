import {
  dataProvider as directusDataProvider
} from "@tspvivek/refine-directus";
import { directusClient } from "./directus-client";

const dataProvider = directusDataProvider(directusClient);

export default dataProvider;