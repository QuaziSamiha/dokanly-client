import { ISingleSelectOption } from "@/types";

/**
 * The 64 districts of Bangladesh, keyed by the division id used in
 * `orderDeliveryRegions`. The district name is what gets saved as `city`.
 */
export const DISTRICTS_BY_DIVISION: Record<string, string[]> = {
  DHAKA: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  CHITTAGONG: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chittagong",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  KHULNA: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  RAJSHAHI: [
    "Bogura",
    "Chapai Nawabganj",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],
  RANGPUR: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  MYMENSINGH: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  SYLHET: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  BARISHAL: [
    "Barguna",
    "Barishal",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],
};

/** Select options for the districts of one division (empty when none is chosen). */
export const getDistrictOptions = (division?: string): ISingleSelectOption[] =>
  (division ? DISTRICTS_BY_DIVISION[division] ?? [] : []).map((name) => ({
    id: name,
    name,
  }));
