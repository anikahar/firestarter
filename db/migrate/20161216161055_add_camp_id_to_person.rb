class AddCampIdToPerson < ActiveRecord::Migration
  def change
    add_column :people, :camp_id, :integer
  end
end
