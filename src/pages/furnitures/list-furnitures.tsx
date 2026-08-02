import { ListFurnituresTable } from "@/pages/furnitures/list-furnitures-table";
import { FurnituresTabs } from "@/pages/furnitures/furnitures-tabs";

export const ListFurnitures = () => {
    return (
        <>
            <FurnituresTabs activeMenu="all" />
            <ListFurnituresTable />
        </>
    );
};
