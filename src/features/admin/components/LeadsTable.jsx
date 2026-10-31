import { LEAD_STATUSES } from "../constants";
import { leadStatusClasses } from "../utils";

export function LeadsTable({ leads, onStatusChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-400">
            <tr>
              <th scope="col" className="py-3.5 px-5">
                Student Name
              </th>
              <th scope="col" className="py-3.5 px-5">
                Email
              </th>
              <th scope="col" className="py-3.5 px-5">
                Course Interested
              </th>
              <th scope="col" className="py-3.5 px-5">
                Status
              </th>
              <th scope="col" className="py-3.5 px-5 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400 text-xs">
                  No student leads recorded yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition text-xs">
                  <th scope="row" className="py-3.5 px-5 font-semibold text-brand-dark">
                    {lead.name}
                  </th>
                  <td className="py-3.5 px-5 text-gray-500">{lead.email}</td>
                  <td className="py-3.5 px-5 font-medium text-brand-primary">{lead.course}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${leadStatusClasses(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <select
                      aria-label={`Status for ${lead.name}`}
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead.id, e.target.value)}
                      className="px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none"
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
