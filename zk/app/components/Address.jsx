import React from "react";

export default function Address({ address }) {
  const shortAddress =
    address &&
    address?.length > 0 &&
    address.slice(0, 5) +
      "..." +
      address.slice(address.length - 4, address.length);

  return <p className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide">{shortAddress}</p>;
}
