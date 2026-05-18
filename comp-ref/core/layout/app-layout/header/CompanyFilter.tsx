import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import keys from '@/constant/keys';
import { ROUTES } from '@/constant/routes';
import { AppSelect } from '@/core/components/app-select';
import useAuth from '@/hooks/use-auth';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllCompanies } from '@/redux/master/company/company.slice';
import { Company } from '@/types/master/company';

const { companyIdKey } = keys;
const { dashboard } = ROUTES;

const CompanyFilter = () => {
  const { user } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { allEntities: companies, allEntityLoading } = useAppSelector((state) => state.company);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleCompanyChange = useCallback(
    (value: Company | null) => {
      setSelectedCompany(value);
      window.localStorage.setItem(companyIdKey, JSON.stringify(value?.id));
      // Don't redirect if we're on the onboarding page
      // The onboarding page will handle the company change internally
      if (!pathname?.includes('/company-onboarding')) {
        push(dashboard.root.path);
      }
    },
    [setSelectedCompany, push, pathname],
  );

  useEffect(() => {
    if (selectedCompany || allEntityLoading) return;

    const storedCompanyId = window.localStorage.getItem(companyIdKey);

    if (storedCompanyId && companies?.length) {
      const parsedId = JSON.parse(storedCompanyId);
      const storedCompany = companies.find((c) => c.id === parsedId);

      if (storedCompany) {
        setSelectedCompany(storedCompany);
        return;
      }
    } else if (user?.company) {
      setSelectedCompany(user.company);
      window.localStorage.setItem(companyIdKey, JSON.stringify(user.company.id));
    }
  }, [user, companies, selectedCompany, allEntityLoading]);

  useEffect(() => {
    dispatch(fetchAllCompanies());
  }, [dispatch]);

  return (
    <AppSelect
      label='Company'
      options={companies}
      value={selectedCompany}
      onChange={handleCompanyChange}
      size='small'
      formControlProps={{ sx: { minWidth: 150, maxWidth: 180 } }}
    />
  );
};

export default memo(CompanyFilter);
