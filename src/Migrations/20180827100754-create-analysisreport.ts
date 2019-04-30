module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("AnalysisReports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      checkRunId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        comment: "Github check run user id",
      },
      analysisUuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        comment: "Mythx analysis uuid",
      },
      report: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      refreshToken: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: () => new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: () => new Date(),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("AnalysisReports");
  },
};
