class AddResponsibilitiesToCamp < ActiveRecord::Migration
  def change
    add_column :camps, :project_manager_id, :integer
    add_column :camps, :vice_project_manager_id, :integer
    add_column :camps, :daily_inspection_responsible_id, :integer
    add_column :camps, :disassembly_responsible_id, :integer
    add_column :camps, :lnt_responsible_id, :integer
    add_column :camps, :funding_responsible_id, :integer
    add_column :camps, :build_responsible_id, :integer
    add_column :camps, :work_manager_id, :integer
    add_column :camps, :burn_responsible_id, :integer
    add_column :camps, :designer_id, :integer
  end
end
