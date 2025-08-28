import Table from "../../components/tables/BasicTables/BasicTableOne";

export default function Withdrawals() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Withdrawals
        </h1>
      </div>
      <Table />
    </div>
  );
}
