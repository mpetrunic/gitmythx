import {Column, CreatedAt, DataType, Model, PrimaryKey, Table, UpdatedAt} from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "AnalysisReports",
})
export default class CheckRunReport extends Model<CheckRunReport> {

    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    public id: number;

    @Column({
        type: DataType.STRING,
    })
    public checkRunId: string;

    @Column({
        type: DataType.STRING,
    })
    public analysisUuid: string;

    @Column({
        type: DataType.JSONB,
    })
    public report: string;

    @CreatedAt
    public createdAt: Date;

    @UpdatedAt
    public updatedAt: Date;
}
