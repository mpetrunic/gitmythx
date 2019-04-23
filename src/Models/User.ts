import {Column, CreatedAt, DataType, Model, PrimaryKey, Table, UpdatedAt} from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "Users"
})
export default class User extends Model<User> {

    @PrimaryKey
    @Column({
        type: DataType.STRING,
    })
    public id: string;

    @Column({
        type: DataType.TEXT,
    })
    public accessToken: string;

    @Column({
        type: DataType.TEXT,
    })
    public refreshToken: string;

    @CreatedAt
    public createdAt: Date;

    @UpdatedAt
    public updatedAt: Date;
}
