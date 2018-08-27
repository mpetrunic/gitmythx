import Sequelize from "sequelize";

export default class Example extends Sequelize.Model {
    public static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                help: {
                    type: DataTypes.STRING,
                },
            },
            { sequelize },
        );
    }

    public static associate(models) {
    }
}
