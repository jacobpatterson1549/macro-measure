export const Help = () => (
    <div className="Help">
        <h1>Macro Measure Help</h1>
        <p>Macro Measure is tool to measure distances to objects.  A popular use is as a golf yardage calculator.</p>
        <p>Create a new group of objects from the Groups link at the top of the site.  Each group can hold many objects, which are referred to as items.</p>
        <p>When viewing a group, its items are shown.  Items can be viewed by clicking on their names.</p>
        <p>When viewing an item, its name is a link back to the list of its group.  From here, the item can be edited and switched. The device's current distance to it is also shown.  Configure the distance unit on the Settings page.</p>
        <p>Item positions are edited by altering their gps coordinates.  The latitude and longitude can be changed to move the item's position N/S or E/W.  These values are changed by the Move Amount value.</p>
        <p>After loading, the tool runs offline, except when accessing the current GPS location of the device.  The groups, items, and other settings are stored on the device, but can be cleared on the Settings page.</p>
    </div>
);