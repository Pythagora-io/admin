type planSummaryItemProps = {
    title: string;
    value?: string;
}

const PlanSummaryItem = ({ title, value }: planSummaryItemProps) => {
    return (
        <div>
            <h3 className="plan-summary-item-header">{title}</h3>
            <p>{value || '-'}</p>
        </div>
    );
}

export default PlanSummaryItem;