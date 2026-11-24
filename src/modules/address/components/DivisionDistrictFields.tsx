"use client";

import React, { useMemo } from "react";
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { ISingleSelectOption } from "@/types";
import { orderDeliveryRegions } from "@/modules/checkout/constants/checkout.constants";
import { getDistrictOptions } from "@/modules/address/constants/bd-locations";

interface IProps<T extends FieldValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  /** Form field holding the division id ("region" at checkout, "state" in the address book). */
  divisionName: Path<T>;
  /** Form field holding the district name. */
  districtName: Path<T>;
  /** Overrides the division list (e.g. to keep an unknown division stored on an order). */
  divisions?: ISingleSelectOption[];
  isRequired?: boolean;
  isLoading?: boolean;
}

/**
 * Division select + District select. The district list stays disabled until a
 * division is chosen and only lists that division's districts; picking a new
 * division clears the district.
 */
export default function DivisionDistrictFields<T extends FieldValues>({
  control,
  setValue,
  divisionName,
  districtName,
  divisions = orderDeliveryRegions,
  isRequired,
  isLoading,
}: IProps<T>) {
  const division = useWatch({ control, name: divisionName }) as string | undefined;
  const district = useWatch({ control, name: districtName }) as string | undefined;

  const districts = useMemo(() => {
    const options = getDistrictOptions(division);
    //* ==== KEEP A SAVED CITY THAT ISN'T A KNOWN DISTRICT (OLDER FREE-TEXT ADDRESSES) ====
    return district && !options.some((o) => o.id === district)
      ? [{ id: district, name: district }, ...options]
      : options;
  }, [division, district]);

  return (
    <>
      <SingleSelectSearch
        labelName="Division"
        name={divisionName}
        control={control}
        options={divisions}
        placeholder="Select division"
        isRequired={isRequired}
        isLoading={isLoading}
        onSelectionChange={(id) => {
          if (id !== division) {
            setValue(districtName, "" as PathValue<T, Path<T>>, {
              shouldDirty: true,
            });
          }
        }}
      />
      <SingleSelectSearch
        labelName="District"
        name={districtName}
        control={control}
        options={districts}
        placeholder={division ? "Select district" : "Select division first"}
        isDisabled={!division}
        isRequired={isRequired}
        isLoading={isLoading}
      />
    </>
  );
}
