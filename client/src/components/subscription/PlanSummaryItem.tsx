type planSummaryItemProps = {
    title: string;
    value?: string;
}

const PlanSummaryItem = ({ title, value }: planSummaryItemProps) => {
    return (
        <div className="text-sm">
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            <p>{value || '-'}</p>
        </div>
    );
}

export default PlanSummaryItem;