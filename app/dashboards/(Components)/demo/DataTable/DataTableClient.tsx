import { Applicant, pagination } from '@/utils/schema';
import { ReduxProvider } from './redux/provider';
import { useApplicants } from '@/features/applicants/hooks';
import DataTableServer from './DataTableServer';

export default function DataTableClient() {
    const { data, error, isFetching, isLoading } = useApplicants({})
    
    // Create the correct props object based on state
    const getProps = () => {
        if (isLoading) {
            return { status: 'loading' as const, isLoading, isFetching };
        }
        if (isFetching) {
            return { status: 'fetching' as const, isLoading, isFetching };
        }
        if (error) {
            return { status: 'error' as const, error };
        }
        if (data) {
            return { 
                status: 'success' as const, 
                data: { 
                    applicant: data.applicants || data.applicants, 
                    pagination: data.pagination 
                } 
            };
        }
        return { status: 'loading' as const, isLoading: true, isFetching: false };
    };
    
    return (
        <ReduxProvider>
            <DataTableServer {...getProps()} />
        </ReduxProvider>
    );
}